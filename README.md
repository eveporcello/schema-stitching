# Schema Stitching

This is a simple example of schema stitching.

- `lifts`: In this folder, you'll find the Lifts service. Run `node index` in that folder to run the server on port 4001.
- `trails`: The location of the Trails service. Run `node index` in that folder to run the server on port 4002.
- `orchestration layer`: The schemas are stitched together by this server. Run `node index` in the folder to run the stitched schemas on port 4000.
