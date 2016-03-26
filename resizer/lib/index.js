import aws from 'aws-sdk';
import _gm from 'gm';

const gm = _gm.subClass({ imageMagick: true }); // Enable ImageMagick integration.
const s3 = new aws.S3();

export function handler(event, context) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  const eventInfo = {
    bucket,
    key
  };

  new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: eventInfo.bucket,
        Key: eventInfo.key
      }, function(err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    })
  .then((data) => {
    var srcBuffer = data.Body;
    var width = 300;
    var height = 200;
    var quality = 65;
    var imageType = 'jpg';

    return new Promise((resolve, reject) => {
      gm(srcBuffer)
        .resize(width, height, "!")
        .quality(quality)
        .toBuffer(imageType, (err, buffer) => {
          if (err) reject(err);
          else {
            resolve(buffer);
          }
        });
    });
  })
  .then((resizedBuffer) => {
    return new Promise((resolve, reject) => {
      s3.putObject({
        Bucket: "sir-test-bucket-resized",
        Key: "test.jpg",
        Body: resizedBuffer
      }, function(err, response) {
        if (err) reject(err);
        else resolve(response);
      });
    });
  })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log("ERROR:");
    console.log(err);
  });
}
