# How to make a release
When one is ready to make a release the following steps should be done:

## Prepare a changelog
The chandelog is located in docs/changelog.md. It has a common info on how to keep it and info for every version and changes for released version. Once you are ready, describe version to be released, what was done, etc.

## Create a tag for version in main branch
Go to main branch and run `npm version`, according to what kind of release it is: patch, minor or major. This command creates a tag with new version in it. When you are sure everything is ok push your changes to remote repository. 
