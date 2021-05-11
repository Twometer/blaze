import cliProgress from 'cli-progress'
import { EventEmitter } from 'events'

export class Worker {
    bar: cliProgress.SingleBar;
    busy: boolean = false;

    constructor(multibar: cliProgress.MultiBar) {
        this.bar = multibar.create(100, 0, { title: '' });
    }
}

export class Scheduler {

    workerPool: Array<Worker> = [];
    emitter: EventEmitter = new EventEmitter();
    enqueued: number = 0;

    constructor(poolSize: number, multibar: cliProgress.MultiBar) {
        for (let i = 0; i < poolSize; i++) {
            this.workerPool.push(new Worker(multibar));
        }

        this.emitter.on('finished', () => {
            this.enqueued--;
        })
    }

    private nextFreeWorker(): Worker | null {
        for (let worker of this.workerPool) {
            if (!worker.busy)
                return worker;
        }
        return null;
    }

    private waitForFinishEvent() {
        return new Promise((resolve, reject) => {
            this.emitter.once('finished', resolve);
        })
    }

    private async waitForFreeWorker(): Promise<Worker> {
        let nextFree = this.nextFreeWorker();
        if (nextFree) {
            return nextFree!!;
        }

        while (!nextFree) {
            await this.waitForFinishEvent();
            nextFree = this.nextFreeWorker();
        }
        return nextFree!!;
    }

    async schedule(fn: (payload: any, worker: Worker, finish: () => void) => void, payload: any) {
        this.enqueued++;
        const worker = await this.waitForFreeWorker();
        worker.busy = true;
        fn(payload, worker, () => {
            worker.busy = false;
            this.emitter.emit('finished');
        })
    }

    async awaitAll() {
        while (this.enqueued > 0)
            await this.waitForFinishEvent();
    }

}