import aws from 'aws-sdk';
import _gm from 'gm';

const gm = _gm.subClass({ imageMagick: true }); // Enable ImageMagick integration.
const s3 = new aws.S3();

export function handler(event, context) {
  const eventInfo = parseEvent(event);

  getObject(eventInfo.bucket, eventInfo.key)
  .then((data) => {
    return resizeImage(data.Body, 300, 200);
  })
  .then((resizedBuffer) => {
    return putObject("sir-test-bucket-resized", eventInfo.key, resizedBuffer);
  })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log("ERROR:");
    console.log(err);
  });
}

const parseEvent = (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  return  { bucket, key };
}

const getObject = (bucket, key) => {
  return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: bucket,
        Key: key
      }, function(err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    })

}

const resizeImage = (srcBuffer, width, height, quality, imageType) => {
  var quality = quality || 65;
  var imageType = imageType || 'jpg';

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
}

const putObject = (bucket, key, body, metadata) => {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: body,
      Metadata: metadata
    }, function(err, response) {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

