# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
 - Add params for search
 - Add opportunity to pass template and params by addr and idtf

## [v0.1.3]
### Fixed
 - add output types path

## [v0.1.2]
### Fixed
 - correct webpack output path

## [v0.1.1]
### Changed
 - package.json main property

## [v0.1.0]
### Added
 - README and LICENSE files
 - Data classes of the sc-client for objects manipulating
 - API for connecting, disconnecting, and checking connection status with the sc-server
 - API for creating, and deleting elements in the sc-memory
 - API for checking the type of elements
 - API for setting and getting content of the sc-link
 - API for getting the list of sc-links by content
 - API for resolving sc-keynodes
 - API for generating and searching constructions in the sc-memory by template
 - API for sc-event registration and destroying in the sc-memory
 - API for checking the state of the sc-event
 - tests for scClient
 - Documentation for contributors and developers
 - CI for checking messages of commits
 - CI for test
 - CI for publishing package on npm
