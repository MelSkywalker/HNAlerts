## HNAlerts

La usuaria está interesada en recibir notificaciones a través de Twitter de ciertos temas en específico que aparecen en [Hacker News](https://news.ycombinator.com/), por ejemplo si en las últimas 2 horas hubo una noticia sobre Facebook, la usuaria está interesada en recibir un “at-message” (ej: @usuaria Última noticia sobre Facebook: https://liga-a-noticia)

Los temas en los cuales la usuaria está interesada se definirán a través de un argumento del terminal.

En una primera iteración el programa solo necesitará correr una vez, es decir ejecutaremos: ej: `node index.js --keyword=Facebook` y preguntará a Hacker News solo una vez.

En una segunda iteración el programa podrá seguir corriendo una vez empezado y cada X minutos hará un pedido a Hacker news para ver si alguna nueva noticia apareció

Usar:
[Twitter](https://www.npmjs.com/package/twitter)
[Cheerio](https://www.npmjs.com/package/cheerio)

node index topic user