const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "../../anti-social-relational-tp-coronados-tech/docs/Api-Antisocial.postman_collection.json",
);
const dst = path.join(__dirname, "../docs/Api-Antisocial.postman_collection.json");

const json = JSON.parse(fs.readFileSync(src, "utf8"));

json.info.name = "Api-Antisocial-Documental";
json.info.description =
  "Colección de pruebas para el TP documental (MongoDB). Usar con el environment de Postman del equipo.";

const users = json.item.find((item) => item.name === "Users");
if (users?.item) {
  users.item = users.item.filter((item) => item.name !== "Profile picture");
}

let text = JSON.stringify(json, null, 2);

const pairs = [
  ["{{uri_user}}1/follow/2", "{{uri_user}}{{user_id}}/follow/{{user_id_2}}"],
  ["{{uri_user}}1/followers", "{{uri_user}}{{user_id}}/followers"],
  ["{{uri_user}}1/following", "{{uri_user}}{{user_id}}/following"],
  ["{{uri_user}}1/follow", "{{uri_user}}{{user_id}}/follow"],
  ["{{uri_user}}2/follow", "{{uri_user}}{{user_id_2}}/follow"],
  ["{{uri_user}}3", "{{uri_user}}{{user_id_3}}"],
  ["{{uri_user}}2", "{{uri_user}}{{user_id_2}}"],
  ["{{uri_user}}1", "{{uri_user}}{{user_id}}"],
  ["{{uri_post}}2/images/1", "{{uri_post}}{{post_id_2}}/images/{{image_id}}"],
  ["{{uri_post}}1/images", "{{uri_post}}{{post_id}}/images"],
  ["{{uri_post}}2/images", "{{uri_post}}{{post_id_2}}/images"],
  ["{{uri_post}}?user_id=1", "{{uri_post}}?user_id={{user_id}}"],
  ["{{uri_post}}2", "{{uri_post}}{{post_id_2}}"],
  ["{{uri_post}}1", "{{uri_post}}{{post_id}}"],
  ["{{uri_comments}}?post_id=2", "{{uri_comments}}?post_id={{post_id_2}}"],
  ["{{uri_comments}}2", "{{uri_comments}}{{comment_id_2}}"],
  ["{{uri_comments}}1", "{{uri_comments}}{{comment_id}}"],
  ["{{uri_tags}}?post_id=1", "{{uri_tags}}?post_id={{post_id}}"],
  ["{{uri_tags}}4", "{{uri_tags}}{{tag_id}}"],
  ["{{uri_tags}}2", "{{uri_tags}}{{tag_id_2}}"],
  ['"follower_id": 2', '"follower_id": "{{user_id_2}}"'],
  ['"follower_id": 1', '"follower_id": "{{user_id}}"'],
  ['"user_id": 1', '"user_id": "{{user_id}}"'],
  ['"user_id": 2', '"user_id": "{{user_id_2}}"'],
  ['"post_id":1', '"post_id": "{{post_id}}"'],
  ['"post_id": 2', '"post_id": "{{post_id_2}}"'],
  ['"post_id": 1', '"post_id": "{{post_id}}"'],
  ['"value": "1"', '"value": "{{user_id}}"'],
  ['"value": "2"', '"value": "{{user_id_2}}"'],
  ['   \\"titulo\\": \\"Mi publicación\\",\\r\\n', ""],
];

for (const [from, to] of pairs) {
  text = text.split(from).join(to);
}

fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, text);
console.log("Collection written:", dst);
