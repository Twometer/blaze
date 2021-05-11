import chalk from 'chalk'
import * as cli from "./cli"
import { program } from "commander";
import { DownloadBatcher, DownloadJob } from './download';
import { ManifestIO, Quality, Format } from "./manifest";
import { QuestionInterface } from "./question"
import { parseUrl, UrlType } from "./youtube"

cli.initialize(sync, download, init);

async function sync() {
    let manifest = ManifestIO.read(program.opts().path || './blaze.json');
    download(manifest.playlist);
}

async function download(link: string) {
    let opts = program.opts();
    let job = new DownloadJob();
    await job.add(link);

    let batcher = new DownloadBatcher(opts.batchSize);
    await batcher.download(job);

    console.log(chalk.green('\nYou download completed successfully'));
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

