# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.5.3] — 2024-01-11

### Changed

- Fixed error on Windows
 
## [0.5.2] — 2023-12-06

### Changed

- Added support for auth token
  
## [0.5.1] — 2023-11-16

### Fixed

- Fixed UI inconsistencies

## [0.5.0] — 2023-11-02

### Changed

- Improved and enhanced onboarding and configuration management experience

### Fixed

- Fixed the logic to get the users
- Fixed the issue of downloading correct Docker image
- Fixed the issue of container startup

## [0.4.0] — 2023-03-24

### Changed

- Refactoring and UX improvements
- Full support on Windows

## [0.3.0] - 2023-01-10

### Added

- Interval of 2 seconds after which extension will refresh to check if an instance is running.
- Added section to choose the LocalStack volume directory.
- Added a button to change the LocalStack volume directory.
- Added Card around logs to enhance their view.

### Changed

- Enhanced the **Update Images** button.
- Removed the `EXTRA_CORS_ALLOWED_ORIGIN` from default configuration.

## [0.2.0] - 2022-12-16

### Added

- You can now update your LocalStack images from the UI.

### Changed

- We have made some changes in the UI:
    - Updates in the control section
    - Moved to a table to display saved configurations
    - Improved UI for inserting a new configuration

### Fixed

- Made configuration persistent
- Logs are correctly displayed

## [0.1.0] - 2022-10-27

### Added

- Initial version of extension
- Environment variables addition
- UI and files hierarchy changes
- Add `docker` build and publish action 
- Refactor the `README` page 
