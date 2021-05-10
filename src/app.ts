import chalk from 'chalk'
import readline from 'readline'
import { Option, program } from "commander";
import { ManifestIO, Quality, Format } from "./manifest";

program.version('1.0.0');

program.command('sync')
    .description('Synchronize the current directory using a manifest')
    .option('-f, --file <path>', 'Override the path of the manifest')
    .option('-d, --delete', "Delete local files that were deleted upstream")
    .action(sync)

program.command('download <link>')
    .description('Download a single file or playlist')
    .option('-o, --output <path>', 'Target directory or file', '.')
    .action(download)

program.command('init')
    .description('Inits the current folder with a sync manifest')
    .action(init);

program.addOption(new Option('-F, --format <format>', 'Output file format')
    .choices(['mp3', 'mp4'])
    .default('mp4'));

program.addOption(new Option('-Q, --quality <quality>', 'Download quality')
    .choices(['normal', 'maxaudio', 'maxvideo'])
    .default('normal'));

program.addHelpText('before', chalk.yellow('blaze 1.0.0\n'));

program.addHelpText('after', `
Try:
  $ blaze download https://youtu.be/dQw4w9WgXcQ
`)

program.parse();

function sync() {
    let opts = program.opts();
    let manifest = ManifestIO.read(opts.path || './blaze.json');
}

function download(link: string) {
    let opts = program.opts();

}

function init() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Playlist Link: ', playlist => {
        if (!playlist) {
            console.log(chalk.red('\nerror: You must specify a playlist'));
            rl.close();
            return;
        }

        rl.question('File format [mp4]: ', format => {
            format = format || 'mp4';

            rl.question('Download quality [normal]: ', quality => {
                quality = quality || 'normal';

                ManifestIO.write('./blaze.json', playlist, quality as Quality, format as Format);
                console.log(chalk.green('\nSuccessfully created a new sync manifest as blaze.json'));
                rl.close();
            })
        })
    });
}

