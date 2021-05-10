import fs from 'fs'

export enum Quality {
    normal = 'normal',
    maxaudio = 'maxaudio',
    maxvideo = 'maxvideo'
}

export enum Format {
    mp3 = 'mp3',
    mp4 = 'mp4'
}

export interface Manifest {
    version: string,
    quality: Quality,
    format: Format,
    playlist: string
}

export class ManifestIO {

    static read(path: string): Manifest {
        let manifest: Manifest = JSON.parse(fs.readFileSync(path, 'utf-8'));
        if (!manifest.version)
            throw new Error('Manifest must specify a version');

        if (!manifest.playlist)
            throw new Error('Manifest must specify a playlist');

        if (!manifest.quality)
            manifest.quality = Quality.normal;

        return manifest;
    }

    static write(path: string, playlist: string, quality: Quality, format: Format) {
        let manifest: Manifest = {
            version: '1.0',
            quality,
            format,
            playlist
        };
        fs.writeFileSync(path, JSON.stringify(manifest, null, 4));
    }

}