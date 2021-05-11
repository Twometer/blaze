import { Format, Quality } from "./manifest";
import { loadPlaylist, parseUrl, UrlType, YouTubeVideo } from "./youtube";

export class DownloadJob {

    videos: Array<string> = [];

    private idToUrl(videoId: string): string {
        return `https://youtube.com/watch?v=${videoId}`;
    }

    async add(url: string) {
        let parsed = parseUrl(url);

        if (parsed.type == UrlType.Playlist) {
            let videos = await loadPlaylist(parsed.id!!);
            videos.map(v => this.idToUrl(v.id))
                .forEach(v => this.videos.push(v));
        } else if (parsed.type == UrlType.Video) {
            this.videos.push(this.idToUrl(parsed.id!!));
        } else {
            throw 'Invalid url'
        }
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

    async download(job: DownloadJob) {
        console.log('Options:', this.options);
        console.log('Job: ', job);
    }

}