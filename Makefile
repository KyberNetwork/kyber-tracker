ifndef stg_user
stg_user:=ubuntu
endif

ifndef stg_server
stg_server:=52.77.238.156
endif

init-db:
	node bin/init_db.js

schema:
	node bin/generate_schema.js

connect-staging:
	ssh $(stg_user)@$(stg_server)

deploy-staging:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .idea \
				--exclude .env \
				--exclude .logs \
				--exclude node_modules \
				. $(stg_user)@$(stg_server):/home/ubuntu/kyber-tracker/
	ssh $(stg_user)@$(stg_server) "export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v8.10.0/bin && pm2 restart all"
