push:
	@ssh ${USER} 'rm -rf /home/ecs-user/blog'
	@scp -r docs/.vitepress/dist/ ${USER}:/home/ecs-user/blog
	@scp docker-compose.yaml ${USER}:/home/ecs-user/docker-compose.blog.yaml
build:
	@yarn docs:build
	@scp -r docs/.vitepress/dist/ ${USER}:/home/ecs-user/blog
	@rm -rf docs/.vitepress/dist/
start:
	@ssh ${USER} 'docker stack deploy -c docker-compose.blog.yaml blog'
stop:
	@ssh ${USER} 'docker stack rm blog'
