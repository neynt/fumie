declare const m: any;

const form = document.getElementById('file-upload-form') as HTMLFormElement;
const file_upload = document.getElementById('file-upload') as HTMLInputElement;

file_upload.addEventListener('change', (evt) => {
  console.log(evt);
  const data = new FormData();
  data.append('image', file_upload.files![0]);
  m.request({
    method: 'POST',
    url: '/upload',
    data,
    deserialize: (x: any) => x,
    config: (xhr: XMLHttpRequest) => {
      xhr.upload.addEventListener('progress', (e) => {
        const prog = e.loaded / e.total;
        console.log(prog);
      });
    },
  }).then((e: any) => {
    console.log("Got a responssee");
    console.log(e);
  }).catch((e: any) => {
    console.log("Got an ereerrroor");
    console.log(e);
  });
});
