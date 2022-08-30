# space-eats-next

## What

- The mission of this project is to slove problem about the disused / abandoned buildings
  - For discovery such buildings, we use satellite remote sensing data and OpenStreetMap
  - For save and share the status of buildings, we use OpenStreetMap
  - For suggest utilize those buildings, we use Open Data from government

## Why

### Probrems

- The presence of disused / abandoned buildings in an area can cause the following problems
  - There is a risk of collapse in the event of a disaster.
  - Sanitary conditions in the surrounding area will deteriorate.
  - The security of the surrounding area will deteriorate.

### Stakeholders

- Local residents are troubled
  - Because their living environment is deteriorating
- Municipalities are also having trouble
  - Because they should keep track of buildings at risk
- The Building owners is also in trouble
  - Because they may have circumstances that make it impossible for them to give up their building
- On the other hand, some people are looking for the disused / abandoned buildings
  - Because they want to restore and utilize those buildings as inexpensively

## How

- The disused / abandoned buildings will be...
  - Overgrown with plants
  - The lights will never be turned on
  - The air conditioning will be turned off
  - The temperature will be low
- Satellite remote sensing data has information such as vegetation index, day and night light index and infrared with location information
  - NDVI: Normalized Difference Vegetation Index
  - DNB: Day Night Band
  - NIR: Near infrared
  - SWIR: Short Wave InfraRed
- OpenStreetMap has shape of buildings with location information
- We believe we can estimate to some extent whether a building is disused / abandoned based on its geometry and remote sensing data
- Once we have some estimates, we will use them as a basis for everyone to do a field survey and update OpenStreetMap

