# Harlan Street Garage cover imagery

These photographs illustrate the fictional garage experience. They show different vehicles; no photograph establishes the sample findings, vehicle condition, shop identity, technician certification, or actual inventory.

Downloaded from Pexels for this cover. The Pexels license permits website use and modifications: https://www.pexels.com/license/

| Asset | Photographer | Source |
| --- | --- | --- |
| `engine.jpg` | Aliaksei Semirski | https://www.pexels.com/photo/close-up-of-car-engine-13972256/ |
| `lift.jpg` | Artem Podrez | https://www.pexels.com/photo/car-on-a-lifter-inside-a-garage-8985514/ |
| `brakes.jpg` | agustin olmedo | https://www.pexels.com/photo/automotive-brake-maintenance-in-workshop-30470930/ |

The corresponding `*-depth.png` assets are relative inverse-depth estimates computed locally from these photographs with `depth-anything/Depth-Anything-V2-Small-hf` (Apache 2.0). They are visual-effect inputs, not metric measurements or a diagnosis. No cloud inference endpoint is required at runtime.

Model: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf

The site serves the images and depth maps locally using the existing base-aware `publicAsset` helper. A static photo and gradient remain visible if WebGL or a depth texture fails. Full photo credits are available in the cover footer.
