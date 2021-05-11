import chalk from 'chalk'
import * as cli from "./cli"
import ora from "ora"
import { program } from "commander";
import { DownloadBatcher, VideoList } from './download';
import { ManifestIO, Quality, Format } from "./manifest";
import { QuestionInterface } from "./question"
import { parseUrl, UrlType } from "./youtube"

cli.initialize(sync, (link: string) => download(link), init);

async function sync() {
    let manifest = ManifestIO.read(program.opts().path || './blaze.json');
    download(manifest.playlist, manifest.format, manifest.quality);
}

async function download(link: string, format?: Format, quality?: Quality) {
    let opts = program.opts();

    let startTime = Date.now();

    let spinner = ora('Building video list...').start();
    let list = new VideoList();
    await list.add(link);
    spinner.succeed(`Loaded ${list.videos().length} video(s)`);

    let batcher = new DownloadBatcher({
        targetDir: opts.dir,
        batchSize: opts.batch,
        format: opts.format || format || Format.mp4,
        quality: opts.quality || quality || Quality.normal,
        deleteLocal: opts.delete || false
    });
    await batcher.download(list);

    let duration = (Date.now() - startTime) / 1000;
    console.log(chalk.green(`\nSuccessfully downloaded ${list.videos().length} video(s) in ${duration} seconds`));
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

