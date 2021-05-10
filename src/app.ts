import {Option, program} from "commander";

program.version('1.0.0')
    .description("World's fastest YouTube downloader and synchronizer")

program.command('sync')
    .description('Synchronize the current directory using a manifest')
    .option('-f, --file <path>', 'Override the path of the manifest')
    .option('-d, --delete', "Delete local files that were deleted upstream")
    .action(sync)

program.command('download <link>')
    .description('Download a single file or playlist')
    .option('-o, --output <path>', 'Target directory or file', '.')
    .action(download)

program.addOption(new Option('-F, --format <format>', 'Output file format')
    .choices(['mp3', 'mp4'])
    .default('mp4'));

program.addOption(new Option('-Q, --quality <quality>', 'Download quality')
    .choices(['normal', 'maxaudio', 'maxvideo'])
    .default('normal'));

program.addHelpText('after', `
Try:
  $ blaze download https://youtu.be/dQw4w9WgXcQ
`)

program.parse();

function sync() {
    let opts = program.opts();
    
}

function download(link: string) {
    let opts = program.opts();

}