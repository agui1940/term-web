import './style/index.scss';
import validator from 'option-validator';
import Emitter from './share/emitter';
import Events from './events';
import Template from './template';
import Drawer from './drawer';
import Commander from './commander';
import Video from './recorder/video';
import Gif from './recorder/gif';
import Inquirer from './inquirer';
import tree from './addon/tree';
import * as utils from './share/utils';

let id = 0;
const instances = [];
export default class Term extends Emitter {
    static get instances() {
        return instances;
    }

    static get version() {
        return '__VERSION__';
    }

    static get utils() {
        return utils;
    }

    static font(name, url) {
        return new Promise((resolve, reject) => {
            if (!window.FontFace) {
                return reject(new Error('FontFace constructor is not supported'));
            }
            const fontFace = new FontFace(name, `url(${url})`);
            return fontFace.load().then((font) => {
                document.fonts.add(font);
                resolve(font);
            });
        });
    }

    static get default() {
        return {
            container: '#term',
            debug: false,
            width: 600,
            height: 500,
            actions: [],
            parseOpt: {},
            recorder: true,
            recordType: 'video',
            gifshotOpt: {},
            draggable: true,
            dragOpt: {},
            fontSize: 13,
            watermark: '',
            fontFamily: 'monospace',
            color: '#b0b2b6',
            title: 'Term Web',
            prefix: 'root@linux: ~ <d color="#00f501">$</d> ',
            welcome: `Last login: ${new Date()}`,
            loading: () => '<d color="yellow">Loading...</d>',
            background: 'rgb(42, 39, 52)',
            pixelRatio: window.devicePixelRatio,
            notFound: (val) => `-bash: <d color='red'>${val}</d>: command not found`,
        };
    }

    static get scheme() {
        return {
            container: 'string|htmldivelement',
            debug: 'boolean',
            width: 'number',
            height: 'number',
            actions: [
                {
                    input: 'string|regexp',
                    output: 'string|function',
                },
            ],
            parseOpt: 'object',
            recorder: 'boolean',
            recordType: 'string',
            gifshotOpt: 'object',
            draggable: 'boolean',
            dragOpt: 'object',
            fontSize: 'number',
            watermark: 'string',
            fontFamily: 'string',
            color: 'string',
            title: 'string',
            prefix: 'string',
            welcome: 'string',
            loading: 'function',
            background: 'string',
            pixelRatio: 'number',
            notFound: 'function',
        };
    }

    constructor(options = {}) {
        super();

        this.options = validator(
            {
                ...Term.default,
                ...options,
            },
            Term.scheme,
        );

        this.isDestroy = false;
        this.isFocus = false;

        this.template = new Template(this);
        this.events = new Events(this);
        this.drawer = new Drawer(this);
        this.commander = new Commander(this);
        this.inquirer = new Inquirer(this);
        this.video = new Video(this);
        this.gif = new Gif(this);

        this.ask = this.commander.ask;
        this.type = this.commander.type;
        this.input = this.commander.input;
        this.output = this.commander.output;
        this.clear = this.drawer.clear;
        this.radio = this.inquirer.radio;
        this.checkbox = this.inquirer.checkbox;
        this.tree = (list) => tree(this, list);

        id += 1;
        this.id = id;
        instances.push(this);
    }

    set color(value) {
        this.options.color = value;
        this.drawer.init();
    }

    get color() {
        return this.options.color;
    }

    set background(value) {
        this.options.background = value;
        this.drawer.init();
    }

    get background() {
        return this.options.background;
    }

    set watermark(value) {
        this.options.watermark = value;
        this.drawer.init();
    }

    get watermark() {
        return this.options.watermark;
    }

    set width(value) {
        this.emit('resize', {
            width: value,
            height: this.height,
        });
    }

    get width() {
        return this.template.$container.clientWidth;
    }

    set height(value) {
        this.emit('resize', {
            width: this.width,
            height: value,
        });
    }

    get height() {
        return this.template.$container.clientHeight;
    }

    set debug(value) {
        this.options.debug = value;
        this.drawer.init();
    }

    get debug() {
        return this.options.debug;
    }

    destroy() {
        instances.splice(instances.indexOf(this), 1);
        this.events.destroy();
        this.template.destroy();
        this.isDestroy = true;
        this.emit('destroy');
    }
}
