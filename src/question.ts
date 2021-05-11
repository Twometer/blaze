import readline from 'readline'

export class QuestionInterface {

    rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    close() {
        this.rl.close();
    }

    question(prompt: string, defaultValue?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let promptExtension = defaultValue != null ? ` [${defaultValue}]: ` : ': ';
            this.rl.question(prompt + promptExtension, value => {
                if (!value && !defaultValue) {
                    reject(`You need to specify a '${prompt}'`);
                    return;
                }
                if (!value) {
                    resolve(defaultValue!!);
                } else {
                    resolve(value);
                }
            });
        });
    }

}