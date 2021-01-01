const child_process = require('child_process');

class CpManager {
    constructor(props){
        this.binary = props.binary;
        this.args = props.args || [];
        this.options = props.options || {};
        this._handleStdout = data => console.log(data.toString());
        this._handleStderr = data => console.log(data.toString());
        this._handleError = error => console.log(error);
        this._handleSpawn = () => console.log('child process started.');
        this._handleExit = code => console.log('child process exited. exit code:', code);
    }

    start = () => {
        this.process = child_process.spawn(this.binary, this.args, this.options);
        this.process.stdout.on('data', data => this.handleStdout(data));
        this.process.stderr.on('data', data => this.handleStderr(data));
        this.process.on('error', error => this.handleError(error));
        this.process.on('spawn', () => this.handleSpawn());
        this.process.on('exit', code => this.handleExit(code));
        this.stdin = this.process.stdin;
    }

    stop = () => {
        this.process.kill('SIGTERM');
        this.process={};
    }

    get handleStdout(){return this._handleStdout}
    get handleStderr(){return this._handleStderr}
    get handleError(){return this._handleError}
    get handleSpawn(){return this._handleSpawn}
    get handleError(){return this._handleError}
    get handleExit(){return this._handleExit}
    set stdoutHandler(handler){this._handleStdout = handler}
    set stderrHandler(handler){this._handleStderr = handler}
    set errorHandler(handler){this._handleError = handler}
    set spawnHandler(handler){this._handleSpawn = handler}
    set exitHandler(handler){this._handleExit = handler}
}

const newChild = options => {
    const cpMgr = new CpManager(options);
    return cpMgr
}

module.exports = {
    newChild
}