import chalk from 'chalk'
import { Option, program } from "commander";

export function initialize(sync: any, download: any, init: any) {
    program.version('1.0.0');

    program.command('sync')
        .description('Synchronize the directory using its manifest')
        .option('-f, --file <path>', 'Override the path of the manifest')
        .option('-d, --delete', "Delete local files that were deleted upstream")
        .action(sync)
    program.command('download <link>')
        .description('Download a single file or playlist')
        .action(download)
    program.command('init')
        .description('Inits the current folder with a sync manifest')
        .action(init);

    program.addOption(new Option('-F, --format <format>', 'Output file format')
        .choices(['mp3', 'mp4']));
    program.addOption(new Option('-Q, --quality <quality>', 'Download quality')
        .choices(['normal', 'maxaudio', 'maxvideo']));
    program.addOption(new Option('-B, --batch <size>', 'Number of concurrent downloads').default(4));
    program.addOption(new Option('-D, --dir <path>', 'Target directory').default('.'))

    program.addHelpText('after', `
Try:
  $ blaze download https://youtu.be/dQw4w9WgXcQ
`)

    program.parse();
}