import { Format, Quality } from "./manifest";
import { getVideoTitle, loadPlaylist, parseUrl, UrlType, YouTubeVideo } from "./youtube";

export class DownloadJob {

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

    async download(job: DownloadJob) {
        //console.log('Options:', this.options);
        //console.log('Job: ', job);
    }

}