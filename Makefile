index.js: index.ts
	tsc

public/index.html: public/index.pug
	(cd public && pug index.pug)

public/app.js: public/app.ts
	(cd public && tsc)
