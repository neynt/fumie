declare const m: any;

let progress: number | null = null;
let link: string = '';

// Tricky bit here is that different browsers have different ideas of what gets
// displayed in the browser, and what is downloaded. We probably only want to
// redirect file types that are near-certain to be displayed in the browser,
// like images.
const redirect_extensions = ['png', 'jpg', 'jpeg', 'gif', 'webm'];

function upload_file(file: File) {
  const data = new FormData();
  data.append('image', file);
  m.request({
    method: 'POST',
    url: '/upload',
    data,
    deserialize: (x: any) => x,
    config: (xhr: XMLHttpRequest) => {
      xhr.upload.addEventListener('progress', (e) => {
        progress = e.loaded / e.total;
        m.redraw();
      });
    },
  }).then((e: string) => {
    const url = e.trim();
    const ext = url.split('.').pop();
    if (ext && redirect_extensions.indexOf(ext.toLowerCase()) >= 0) {
      window.location = url as any;
    }
    link = url;
    m.redraw();
  }).catch((e: any) => {
    console.log(e);
    link = 'Error';
    m.redraw();
  });
}

function drop(event: DragEvent) {
  event.preventDefault();
  upload_file(event.dataTransfer!.files[0]);
}

function dragover(event: DragEvent) {
  event.preventDefault();
}

function file_chosen(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    upload_file(target.files![0]);
  }
}

window.addEventListener('paste', (e_: Event) => {
  const e = e_ as ClipboardEvent;
  if (e.clipboardData && e.clipboardData.files) {
    upload_file((e as ClipboardEvent).clipboardData.files![0]);
  }
});

const root = document.getElementById('root');

const LoadingBar = {
  view: () => {
    if (progress === null) {
      return m('div');
    }
    const width = 150;
    const filled_width = 150 * progress;
    const empty_width = width - filled_width;
    return m('.loader', {
      style: {
        'width': filled_width + 'px',
        'border-right-width': empty_width + 'px',
      },
    })
  }
};

const App = {
  view: () => {
    const children = [];
    if (link) {
      children.push(
        m('p', [
          m('a', { href: link }, link),
        ])
      );
    } else if (progress !== null) {
      children.push(m(LoadingBar));
    } else {
      children.push(
        m('form', {
          enctype: 'multipart/form-data',
          action: '/upload',
          method: 'post',
        }, [
          m('label', {
            class: 'file-upload-label',
            for: 'file-upload',
          }, 'Upload a file'),
          m('input', {
            id: 'file-upload',
            onchange: file_chosen,
            type: 'file',
            name: 'image',
          }),
        ])
      );
    }
    return m('.tray', children);
  },
};

document.body.ondrop = drop;
document.body.ondragover = dragover;

m.mount(root, App);
