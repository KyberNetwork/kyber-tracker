init-db:
	node bin/init_db.js

schema:
	node bin/generate_schema.js

connect-staging:
	ssh ubuntu@52.77.238.156

deploy-staging:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .idea \
				--exclude .env \
				--exclude .logs \
				--exclude node_modules \
				. ubuntu@52.77.238.156:/home/ubuntu/kyber-tracker/
