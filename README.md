# 🔥 Blaze
Blaze is an incredibly fast YouTube downloader and playlist synchronizer, written in TypeScript.

It can quickly download single videos or entire playlists from YouTube using multiple parallel connections, either as audio or video, and only updates the files you don't already have.

## Installation
Install from the npm repository with

```
$ npm install -g @twometer/blaze
```

## Usage
After installing globally from npm, the software should be registered as `blaze` and you can run it from any command line.

You can get information about all configuration options and commands from the software itself at any time using
```
$ blaze help
```

### Basic downloading
If you just want to download a single video or playlist, you can use the following command:

```
$ blaze download <link>
```

### Synchronizing
Blaze supports "playlist synchronizing". That means you can link a YouTube playlist to a local folder, and Blaze will download all missing videos automatically once you do
```
$ blaze sync
```

To link a folder to a playlist, you can either manually create the `blaze.json` manifest file, or you can do 
```
$ blaze init
```
to get an assistant that guides you through the process of creating such a file.

### Configuration
Blaze supports the following configuration options:
```
-F, --format <format>       Specify the output file format (can be "mp3" or "mp4")
-Q, --quality <quality>     Optimize for video quality, audio quality or both ('normal', 'maxaudio', 'maxvideo')
-B, --batch <size>          Change the download batch sizes, e.g. how many connections should be opened in parallel
-D, --dir <path>            Specify a different target directory. By default, blaze operates in the current directory.
```


## Legal Notice
This is free and open-source software. I am not associated with YouTube in any way. I do not support or endorse illegal downloading of copyrighted content.