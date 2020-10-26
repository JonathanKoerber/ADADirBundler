# What is this?
This is CLI, written using Node.js, converts a  directory exported from Adobe Animate with its image resource as well as the logic for the animation for separate files. This tool converts the images into base64 and combines them and the animation logic in one HTML file. The specific use case of this application is to prepare animation to run in an environment which prevents the animation from calling outside resources. 

The application takes as an input the directory from Adobe Animate and returns the bundled directory either into a file that is passed to the app or in to a files 'publish_index.html'.

*******************************************************************************************************
## Installation from NPM

`npm install ada_dir_bundler --save`

## Instalation from GIT

`git@github.com:JonathanKoerber/ADADirBundler.git`

*******************************************************************************************************
## Runn the application 
`ADADirBundler -d <Adobe Animate Input Dir> -o <your output file(optional)>`

### Application Flags
  -d option will add input directory (required)
  -o option for output (not required)


