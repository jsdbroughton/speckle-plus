# Speckle+

Speckle+ is a Chrome Extension that intercepts the Speckle frontend requests to synchronise the data with the current view.

## Roadmap Features

### Speckle Presenter

Users can record a series of “scenes”

- [ ] User navigates to a view, adds filters, overlays
- [x] User “Saves” to presentation history list of views
- [x] User can change the order of views
- [ ] User can allocate names to the views
- [x] Users can play back the views
  - [ ] User selects Presenter mode
  - [ ] Other Speckle UI hides
  - [ ] Back and Forward buttons replace the standard view tools
  - [x] Back and forward cycle through the saved views
  - [ ] Exit Presenter mode shows the default UI
- [ ] Users can export/import Presentations
  - [ ] Import/Export as JSON
  - [ ] Commit presentation to Speckle Branch (if user has permissions)
  - [ ] Commit presentation to Blob store

### Property Filter

- [ ] Parses the current viewer objects and presents the dynamic properties
- [ ] User can then select which to include/omit
- [ ] Filtered property list can then be sent as a commit to any branch in the Stream

### Stream Explorer

- [ ] Presents the Stream/branch and commit structure as a directory style view
- [ ] Facilitates the combining and overlaying features available in the Speckle frontend

### Commit Curator

- [ ] Using the frontend to combine commits and filter/isolate objects from each to assemble a new commit payload to a selected branch

Methodologies to test

- [x] Use WebRequest intercepts to repeat the current viewer query
- [x] Inject objectloader results in extension UI
- [ ] As the viewer loads up the browser cache, use that instead
