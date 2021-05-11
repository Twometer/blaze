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

export class DownloadBatcher {

    batchSize: number;

    constructor(batchSize: number) {
        this.batchSize = batchSize;
    }

    async download(job: DownloadJob) {
        
    }

}