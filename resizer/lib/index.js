import aws from 'aws-sdk';


export function handler(event, context) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const s3 = new aws.S3();

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
  }).then((data) => {
      console.log(data);
    },
    (err) => {
      console.log("ERROR:");
      console.log(err);
    });
}
