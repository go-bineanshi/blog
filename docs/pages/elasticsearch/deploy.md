# Elasticsearch 7.x 部署

## 一、 Elasticsearch 部署

### 1.1 Docker 部署

```shell
docker run -d --name elasticsearch --net app-tier -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.17.21
```

运行结果：
![docker run elasticsearch](https://blog.qiniu.g-bill.club/blog/202405061348881.png)

访问：[http://localhost:9200](http://localhost:9200)

![http://localhost:9200](https://blog.qiniu.g-bill.club/blog/202405061349907.png)

或者命令行查看

```shell
curl -X GET "localhost:9200/_cat/nodes?v&pretty"
```

![nodes](https://blog.qiniu.g-bill.club/blog/202405061351031.png)

### 1.2 docker-compose 部署

```yaml
version: "3.9"
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.21
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - app-tier
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.21
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    networks:
      - app-tier
  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.21
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    networks:
      - app-tier

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  app-tier:
    driver: bridge
```

## 二、部署 Kibana

### 2.1 docker 部署

```shell
docker run -d --name kibana --net app-tier -e elasticsearch.hosts=elasticsearch:9200 -p 5601:5601 kibana:7.17.21
```

运行后访问 [http://localhost:5601](http://localhost:5601)

![](https://blog.qiniu.g-bill.club/blog/202405061451651.png)
