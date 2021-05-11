import axios from 'axios'

export enum UrlType {
    Unknown,
    Invalid,
    Playlist,
    Video
}

export interface YouTubeUrl {
    type: UrlType,
    id: string | null
}

export interface YouTubeVideo {
    id: string,
    title: string
}

export function parseUrl(urlString: string): YouTubeUrl {
    try {
        let url = new URL(urlString);
        if (url.hostname == 'youtube.com' || url.hostname == 'www.youtube.com') {
            // YouTube long-format url

            if (url.pathname == '/watch' && url.searchParams.has('v')) {
                // Video
                return { type: UrlType.Video, id: url.searchParams.get('v') }
            } else if (url.pathname == '/playlist' && url.searchParams.has('list')) {
                // Playlist
                return { type: UrlType.Playlist, id: url.searchParams.get('list') }
            } else {
                // Unsupported YouTube URL
                return { type: UrlType.Invalid, id: null };
            }

        } else if (url.hostname == 'youtu.be') {
            // YouTube short-format url
            return { type: UrlType.Video, id: url.pathname.substr(1) }
        } else {
            // Not a YouTube URL
            return { type: UrlType.Invalid, id: null };
        }
    } catch {
        // Not even a valid URL
        return { type: UrlType.Invalid, id: null };
    }
}

function findJsonData(inputData: string, after: string, before: string) {
    let outputData = inputData.substr(inputData.indexOf(after + '{') + after.length);
    outputData = outputData.substr(0, outputData.indexOf(before));
    return JSON.parse(outputData);
}

function parseVideoRenderer(item: any): YouTubeVideo {
    return { id: item.videoId, title: item.title.runs[0].text };
}

function parseYoutubeConfig(data: any) {
    let youtubeConfig = findJsonData(data, 'ytcfg.set(', ');');
    return {
        apiKey: youtubeConfig.INNERTUBE_API_KEY,
        context: youtubeConfig.INNERTUBE_CONTEXT
    }
}

function parseYtInitialData(data: any) {
    return findJsonData(data, 'var ytInitialData = ', ';</script>');
}

async function fetchMorePlaylistData(playlist: Array<YouTubeVideo>, apiKey: string, continuationToken: string, context: any) {
    let continuationUrl = `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`;
    let continuationPayload = { continuation: continuationToken, context };

    let data = (await axios.post(continuationUrl, continuationPayload)).data;
    let videoItems = data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;

    for (let item of videoItems) {
        if (item.continuationItemRenderer) {
            // yay, recursion! let's continue again!
            let newContinuationToken = item.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
            await fetchMorePlaylistData(playlist, apiKey, newContinuationToken, context);
        } else if (item.playlistVideoRenderer) {
            // turn playlist items into more readable stuff
            playlist.push(parseVideoRenderer(item.playlistVideoRenderer));
        }
    }
}

export async function loadPlaylist(playlistId: string) {
    let data = (await axios.get(`https://www.youtube.com/playlist?list=${playlistId}`)).data;

    // load internal fuckery
    let playlistData = parseYtInitialData(data);
    let youtubeConf = parseYoutubeConfig(data);

    // decode internal fuckery
    let videoItems = playlistData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;

    let playlist = [];
    for (let item of videoItems) {
        if (item.continuationItemRenderer) {
            // turn continuation items into the continued items
            let continuationToken = item.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
            await fetchMorePlaylistData(playlist, youtubeConf.apiKey, continuationToken, youtubeConf.context);
        } else if (item.playlistVideoRenderer) {
            // turn playlist items into more readable stuff
            playlist.push(parseVideoRenderer(item.playlistVideoRenderer));
        }
    }

    return playlist;
}