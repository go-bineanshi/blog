import{_ as l,r as c,o as p,c as i,a as n,b as s,d as e,e as t}from"./app-CCeybfeQ.js";const o={},u=t(`<h1 id="elasticsearch-7-x-部署" tabindex="-1"><a class="header-anchor" href="#elasticsearch-7-x-部署"><span>Elasticsearch 7.x 部署</span></a></h1><h2 id="一、-elasticsearch-部署" tabindex="-1"><a class="header-anchor" href="#一、-elasticsearch-部署"><span>一、 Elasticsearch 部署</span></a></h2><h3 id="_1-1-docker-部署" tabindex="-1"><a class="header-anchor" href="#_1-1-docker-部署"><span>1.1 Docker 部署</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">--name</span> elasticsearch <span class="token parameter variable">--net</span> app-tier <span class="token parameter variable">-p</span> <span class="token number">9200</span>:9200 <span class="token parameter variable">-p</span> <span class="token number">9300</span>:9300 <span class="token parameter variable">-e</span> <span class="token string">&quot;discovery.type=single-node&quot;</span> elasticsearch:7.17.21
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>运行结果： <img src="https://blog.qiniu.g-bill.club/blog/202405061348881.png" alt="docker run elasticsearch"></p>`,5),r={href:"http://localhost:9200",target:"_blank",rel:"noopener noreferrer"},d=t(`<p><img src="https://blog.qiniu.g-bill.club/blog/202405061349907.png" alt="http://localhost:9200"></p><p>或者命令行查看</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-X</span> GET <span class="token string">&quot;localhost:9200/_cat/nodes?v&amp;pretty&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://blog.qiniu.g-bill.club/blog/202405061351031.png" alt="nodes"></p><h3 id="_1-2-docker-compose-部署" tabindex="-1"><a class="header-anchor" href="#_1-2-docker-compose-部署"><span>1.2 docker-compose 部署</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">&quot;3.9&quot;</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">es01</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/elasticsearch/elasticsearch<span class="token punctuation">:</span>7.17.21
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> es01
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> node.name=es01
      <span class="token punctuation">-</span> cluster.name=es<span class="token punctuation">-</span>docker<span class="token punctuation">-</span>cluster
      <span class="token punctuation">-</span> discovery.seed_hosts=es02<span class="token punctuation">,</span>es03
      <span class="token punctuation">-</span> cluster.initial_master_nodes=es01<span class="token punctuation">,</span>es02<span class="token punctuation">,</span>es03
      <span class="token punctuation">-</span> bootstrap.memory_lock=true
      <span class="token punctuation">-</span> <span class="token string">&quot;ES_JAVA_OPTS=-Xms512m -Xmx512m&quot;</span>
    <span class="token key atrule">ulimits</span><span class="token punctuation">:</span>
      <span class="token key atrule">memlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">soft</span><span class="token punctuation">:</span> <span class="token number">-1</span>
        <span class="token key atrule">hard</span><span class="token punctuation">:</span> <span class="token number">-1</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> data01<span class="token punctuation">:</span>/usr/share/elasticsearch/data
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> 9200<span class="token punctuation">:</span><span class="token number">9200</span>
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> app<span class="token punctuation">-</span>tier
  <span class="token key atrule">es02</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/elasticsearch/elasticsearch<span class="token punctuation">:</span>7.17.21
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> es02
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> node.name=es02
      <span class="token punctuation">-</span> cluster.name=es<span class="token punctuation">-</span>docker<span class="token punctuation">-</span>cluster
      <span class="token punctuation">-</span> discovery.seed_hosts=es01<span class="token punctuation">,</span>es03
      <span class="token punctuation">-</span> cluster.initial_master_nodes=es01<span class="token punctuation">,</span>es02<span class="token punctuation">,</span>es03
      <span class="token punctuation">-</span> bootstrap.memory_lock=true
      <span class="token punctuation">-</span> <span class="token string">&quot;ES_JAVA_OPTS=-Xms512m -Xmx512m&quot;</span>
    <span class="token key atrule">ulimits</span><span class="token punctuation">:</span>
      <span class="token key atrule">memlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">soft</span><span class="token punctuation">:</span> <span class="token number">-1</span>
        <span class="token key atrule">hard</span><span class="token punctuation">:</span> <span class="token number">-1</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> data02<span class="token punctuation">:</span>/usr/share/elasticsearch/data
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> app<span class="token punctuation">-</span>tier
  <span class="token key atrule">es03</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/elasticsearch/elasticsearch<span class="token punctuation">:</span>7.17.21
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> es03
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> node.name=es03
      <span class="token punctuation">-</span> cluster.name=es<span class="token punctuation">-</span>docker<span class="token punctuation">-</span>cluster
      <span class="token punctuation">-</span> discovery.seed_hosts=es01<span class="token punctuation">,</span>es02
      <span class="token punctuation">-</span> cluster.initial_master_nodes=es01<span class="token punctuation">,</span>es02<span class="token punctuation">,</span>es03
      <span class="token punctuation">-</span> bootstrap.memory_lock=true
      <span class="token punctuation">-</span> <span class="token string">&quot;ES_JAVA_OPTS=-Xms512m -Xmx512m&quot;</span>
    <span class="token key atrule">ulimits</span><span class="token punctuation">:</span>
      <span class="token key atrule">memlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">soft</span><span class="token punctuation">:</span> <span class="token number">-1</span>
        <span class="token key atrule">hard</span><span class="token punctuation">:</span> <span class="token number">-1</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> data03<span class="token punctuation">:</span>/usr/share/elasticsearch/data
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> app<span class="token punctuation">-</span>tier

<span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token key atrule">data01</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local
  <span class="token key atrule">data02</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local
  <span class="token key atrule">data03</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> local

<span class="token key atrule">networks</span><span class="token punctuation">:</span>
  <span class="token key atrule">app-tier</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> bridge
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="二、部署-kibana" tabindex="-1"><a class="header-anchor" href="#二、部署-kibana"><span>二、部署 Kibana</span></a></h2><h3 id="_2-1-docker-部署" tabindex="-1"><a class="header-anchor" href="#_2-1-docker-部署"><span>2.1 docker 部署</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">--name</span> kibana <span class="token parameter variable">--net</span> app-tier <span class="token parameter variable">-e</span> <span class="token assign-left variable">elasticsearch.hosts</span><span class="token operator">=</span>elasticsearch:9200 <span class="token parameter variable">-p</span> <span class="token number">5601</span>:5601 kibana:7.17.21
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,9),k={href:"http://localhost:5601",target:"_blank",rel:"noopener noreferrer"},v=n("p",null,[n("img",{src:"https://blog.qiniu.g-bill.club/blog/202405061451651.png",alt:""})],-1);function m(b,h){const a=c("ExternalLinkIcon");return p(),i("div",null,[u,n("p",null,[s("访问："),n("a",r,[s("http://localhost:9200"),e(a)])]),d,n("p",null,[s("运行后访问 "),n("a",k,[s("http://localhost:5601"),e(a)])]),v])}const y=l(o,[["render",m],["__file","deploy.html.vue"]]),_=JSON.parse('{"path":"/pages/elasticsearch/deploy.html","title":"Elasticsearch 7.x 部署","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"一、 Elasticsearch 部署","slug":"一、-elasticsearch-部署","link":"#一、-elasticsearch-部署","children":[{"level":3,"title":"1.1 Docker 部署","slug":"_1-1-docker-部署","link":"#_1-1-docker-部署","children":[]},{"level":3,"title":"1.2 docker-compose 部署","slug":"_1-2-docker-compose-部署","link":"#_1-2-docker-compose-部署","children":[]}]},{"level":2,"title":"二、部署 Kibana","slug":"二、部署-kibana","link":"#二、部署-kibana","children":[{"level":3,"title":"2.1 docker 部署","slug":"_2-1-docker-部署","link":"#_2-1-docker-部署","children":[]}]}],"git":{"updatedTime":1714980406000,"contributors":[{"name":"go-bineanshi","email":"bineanshi@163.com","commits":1}]},"filePathRelative":"pages/elasticsearch/deploy.md"}');export{y as comp,_ as data};
