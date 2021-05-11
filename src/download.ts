import fs from 'fs'
import ytdl from 'ytdl-core'
import path from 'path'
import chalk from 'chalk';
import cliProgress from 'cli-progress'
import { Format, Quality } from "./manifest";
import { getVideoTitle, loadPlaylist, parseUrl, UrlType, YouTubeVideo } from "./youtube";
import { Scheduler, Worker } from './scheduler';

export class VideoList {

    private videoList: Array<YouTubeVideo> = [];

    async add(url: string) {
        let parsed = parseUrl(url);

        if (parsed.type == UrlType.Playlist) {
            let videos = await loadPlaylist(parsed.id!!);
            for (let video of videos)
                this.videoList.push(video);
        } else if (parsed.type == UrlType.Video) {
            let video = await getVideoTitle(parsed.id!!)
            this.videoList.push({
                id: parsed.id!!,
                title: video
            });
        } else {
            throw 'Invalid url'
        }
    }

    videos(): Array<YouTubeVideo> {
        return this.videoList;
    }

}

export interface DownloadOptions {
    targetDir: string,
    batchSize: number,
    format: Format,
    quality: Quality,
    deleteLocal: boolean
}

export class DownloadBatcher {

    options: DownloadOptions;

    constructor(options: DownloadOptions) {
        this.options = options;
    }

    private idToUrl(videoId: string): string {
        return `https://youtube.com/watch?v=${videoId}`;
    }

    private escapePath(videoTitle: string): string {
        return videoTitle.replace(/(\\|\/|:|\*|\?|"|<|>|\|)/g, '');
    }

    private runJob(job: DownloadJob, worker: Worker, finish: () => void) {
        worker.bar.start(1, 0, {
            title: 'preparing...'
        });

        const stream = ytdl(this.idToUrl(job.video.id), {
            filter: job.config.filter as ytdl.Filter,
            quality: job.config.quality
        });
        stream.pipe(fs.createWriteStream(path.resolve(this.options.targetDir, `${this.escapePath(job.video.title)}.${job.config.extension}`)));

        stream.on('progress', (chunk, downloaded, total) => {
            worker.bar.setTotal(total);
            worker.bar.update(downloaded, { title: job.video.title });
        });

        stream.on('end', () => {
            finish();
        });
    }

    async download(list: VideoList) {
        console.log("\nDownloading videos...");

        let multibar = new cliProgress.MultiBar({
            format: ` ${chalk.greenBright('{bar} {percentage}%')} | ETA: {eta} s | {title}`,
            clearOnComplete: false,
            hideCursor: true
        }, cliProgress.Presets.rect);

        let requiredWorkers = Math.min(list.videos().length, this.options.batchSize);
        let scheduler = new Scheduler(requiredWorkers, multibar);

        let ytdlConfig = new YtdlConfig(this.options);

        let videos = list.videos();
        for (let video of videos) {
            let job = new DownloadJob(video, ytdlConfig);
            await scheduler.schedule(this.runJob.bind(this), job);
        }

        await scheduler.awaitAll();

        multibar.stop();
    }

}

class DownloadJob {
    video: YouTubeVideo;
    config: YtdlConfig;

    constructor(video: YouTubeVideo, config: YtdlConfig) {
        this.video = video;
        this.config = config;
    }
}

class YtdlConfig {
    extension: string = 'mp4';
    quality: string = 'highest';
    filter: string = 'videoandaudio';

    constructor(options: DownloadOptions) {
        if (options.quality == Quality.maxaudio) {
            this.quality = 'highestaudio';
        } else if (options.quality == Quality.maxvideo) {
            this.quality = 'highestvideo';
        }

        if (options.format == Format.mp3) {
            this.filter = 'audioonly';
            this.extension = 'mp3';
        }
    }
}