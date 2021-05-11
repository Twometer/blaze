import chalk from 'chalk'
import { Option, parse, program } from "commander";
import { DownloadJob } from './download';
import { ManifestIO, Quality, Format } from "./manifest";
import { QuestionInterface } from "./question"
import { parseUrl, UrlType } from "./youtube"

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

program.addOption(new Option('-B, --batch <size>', 'Download batch size'));

program.addHelpText('before', chalk.yellow('blaze 1.0.0\n'));

program.addHelpText('after', `
Try:
  $ blaze download https://youtu.be/dQw4w9WgXcQ
`)

program.parse();

async function sync() {
    let opts = program.opts();
    let manifest = ManifestIO.read(opts.path || './blaze.json');

    let job = new DownloadJob();
    job.add(manifest.playlist);


}

async function download(link: string) {
    let opts = program.opts();

    let job = new DownloadJob();
    job.add(link);
    
}

async function init() {
    let iface = new QuestionInterface();

    try {
        let playlistUrl = await iface.question('Playlist URL');
        if (parseUrl(playlistUrl).type != UrlType.Playlist) {
            throw 'Not a valid YouTube playlist link';
        }

        let format = await iface.question('File format', 'mp4');
        let quality = await iface.question('Quality', 'normal');

        ManifestIO.write('./blaze.json', playlistUrl, quality as Quality, format as Format);
        console.log(chalk.green('\nSuccessfully created a new sync manifest as blaze.json'));
    } catch (e) {
        console.log(chalk.red('\nerror: ' + e));
    }
    iface.close();
}

