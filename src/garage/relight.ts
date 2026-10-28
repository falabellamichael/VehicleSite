import {
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D photo;
  uniform sampler2D depthMap;
  uniform vec2 crop;
  uniform float aspect;
  uniform vec3 light;
  uniform float shop;
  vec2 imageUV(vec2 uv) { return (uv - .5) * crop + .5; }
  float heightAt(vec2 uv) { return texture2D(depthMap, imageUV(uv)).r * .13; }
  void main() {
    vec3 color = texture2D(photo, imageUV(vUv)).rgb;
    float z = heightAt(vUv);
    float e = .003;
    vec3 normal = normalize(vec3(
      (heightAt(vUv - vec2(e, 0.)) - heightAt(vUv + vec2(e, 0.))) / (2. * e * aspect),
      (heightAt(vUv - vec2(0., e)) - heightAt(vUv + vec2(0., e))) / (2. * e), 1.));
    vec3 direction = vec3((light.x - vUv.x) * aspect, light.y - vUv.y, light.z - z);
    float diffuse = max(dot(normal, normalize(direction)), .0);
    float shadow = 1.;
    for (int i = 1; i <= 10; i++) {
      float t = float(i) / 10.;
      vec2 sampleUV = mix(vUv, light.xy, t);
      float rayHeight = mix(z + .008, light.z, t);
      shadow = min(shadow, smoothstep(-.018, .018, rayHeight - heightAt(sampleUV)));
    }
    float falloff = .22 / (.12 + dot(direction, direction));
    vec3 warm = vec3(1.0, .74, .43);
    vec3 lit = color * (.19 + warm * diffuse * falloff * mix(.4, 1., shadow));
    float glow = exp(-length(direction.xy) * 5.) * .022;
    gl_FragColor = vec4(mix(lit + warm * glow, color * .92, shop), 1.);
  }
`;

export async function createRelighter(
  canvas: HTMLCanvasElement,
  photoUrl: string,
  depthUrl: string,
) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const loader = new TextureLoader();
  const loaded = await Promise.allSettled([
    loader.loadAsync(photoUrl),
    loader.loadAsync(depthUrl),
  ]);
  if (loaded.some((result) => result.status === "rejected")) {
    for (const result of loaded)
      if (result.status === "fulfilled") result.value.dispose();
    renderer.dispose();
    throw new Error("Inspection textures unavailable");
  }
  const [photo, depthMap] = loaded.map(
    (result) =>
      (
        result as PromiseFulfilledResult<
          Awaited<ReturnType<typeof loader.loadAsync>>
        >
      ).value,
  );
  photo.colorSpace = NoColorSpace;
  depthMap.colorSpace = NoColorSpace;
  const uniforms = {
    photo: { value: photo },
    depthMap: { value: depthMap },
    crop: { value: new Vector2(1, 1) },
    aspect: { value: 1 },
    light: { value: new Vector3(0.72, 0.65, 0.38) },
    shop: { value: 0 },
  };
  const material = new ShaderMaterial({
    uniforms,
    fragmentShader,
    vertexShader:
      "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
  });
  const geometry = new PlaneGeometry(2, 2);
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    resize(width: number, height: number, imageAspect: number) {
      renderer.setSize(width, height, false);
      const aspect = width / height;
      uniforms.aspect.value = aspect;
      uniforms.crop.value.set(
        Math.min(1, aspect / imageAspect),
        Math.min(1, imageAspect / aspect),
      );
    },
    draw(x: number, y: number, height: number, shop: boolean) {
      uniforms.light.value.set(x, 1 - y, height);
      uniforms.shop.value = shop ? 1 : 0;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      photo.dispose();
      depthMap.dispose();
      renderer.dispose();
    },
  };
}
