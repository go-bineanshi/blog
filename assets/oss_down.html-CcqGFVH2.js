import{_ as n,o as s,c as a,e as t}from"./app-CCeybfeQ.js";const p={},o=t(`<h1 id="golang-脚本下载-aliyun-oss-内所有的文件" tabindex="-1"><a class="header-anchor" href="#golang-脚本下载-aliyun-oss-内所有的文件"><span>Golang 脚本下载 aliyun oss 内所有的文件</span></a></h1><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;github.com/aliyun/aliyun-oss-go-sdk/oss&quot;</span>
	<span class="token string">&quot;os&quot;</span>
	<span class="token string">&quot;path/filepath&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量 OSS_ACCESS_KEY_ID 和OSS_ACCESS_KEY_SECRET。</span>
	provider<span class="token punctuation">,</span> err <span class="token operator">:=</span> oss<span class="token punctuation">.</span><span class="token function">NewEnvironmentVariableCredentialsProvider</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Error:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		os<span class="token punctuation">.</span><span class="token function">Exit</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// 创建OSSClient实例。</span>
	<span class="token comment">// yourEndpoint填写Bucket对应的Endpoint，以华东1（杭州）为例，填写为https://oss-cn-hangzhou.aliyuncs.com。其它Region请按实际情况填写。</span>
	client<span class="token punctuation">,</span> err <span class="token operator">:=</span> oss<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span><span class="token string">&quot;https://oss-cn-beijing.aliyuncs.com&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> oss<span class="token punctuation">.</span><span class="token function">SetCredentialsProvider</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>provider<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Error:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		os<span class="token punctuation">.</span><span class="token function">Exit</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// 填写存储空间名称。</span>
	bucketName <span class="token operator">:=</span> <span class="token string">&quot;ali-auction&quot;</span>
	bucket<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">Bucket</span><span class="token punctuation">(</span>bucketName<span class="token punctuation">)</span>

	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token function">panic</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	continueToken <span class="token operator">:=</span> <span class="token string">&quot;&quot;</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		lsRes<span class="token punctuation">,</span> err <span class="token operator">:=</span> bucket<span class="token punctuation">.</span><span class="token function">ListObjectsV2</span><span class="token punctuation">(</span>oss<span class="token punctuation">.</span><span class="token function">ContinuationToken</span><span class="token punctuation">(</span>continueToken<span class="token punctuation">)</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token function">panic</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>

		<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup
		semaphore <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">)</span> <span class="token comment">// 控制并发数为10</span>

		<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> object <span class="token operator">:=</span> <span class="token keyword">range</span> lsRes<span class="token punctuation">.</span>Objects <span class="token punctuation">{</span>
			wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
			semaphore <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// 占用一个信号量</span>
			<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>obj oss<span class="token punctuation">.</span>ObjectProperties<span class="token punctuation">)</span> <span class="token punctuation">{</span>
				<span class="token keyword">defer</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
					wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
					<span class="token operator">&lt;-</span>semaphore <span class="token comment">// 释放一个信号量</span>
				<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
				<span class="token function">downloadObject</span><span class="token punctuation">(</span>bucket<span class="token punctuation">,</span> obj<span class="token punctuation">)</span>
			<span class="token punctuation">}</span><span class="token punctuation">(</span>object<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

		<span class="token keyword">if</span> lsRes<span class="token punctuation">.</span>IsTruncated <span class="token punctuation">{</span>
			continueToken <span class="token operator">=</span> lsRes<span class="token punctuation">.</span>NextContinuationToken
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">downloadObject</span><span class="token punctuation">(</span>bucket <span class="token operator">*</span>oss<span class="token punctuation">.</span>Bucket<span class="token punctuation">,</span> object oss<span class="token punctuation">.</span>ObjectProperties<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>object<span class="token punctuation">.</span>Key<span class="token punctuation">,</span> object<span class="token punctuation">.</span>Type<span class="token punctuation">,</span> object<span class="token punctuation">.</span>Size<span class="token punctuation">,</span> object<span class="token punctuation">.</span>ETag<span class="token punctuation">,</span> object<span class="token punctuation">.</span>LastModified<span class="token punctuation">,</span> object<span class="token punctuation">.</span>StorageClass<span class="token punctuation">,</span> <span class="token string">&quot;--&quot;</span><span class="token punctuation">,</span> object<span class="token punctuation">.</span>RestoreInfo<span class="token punctuation">)</span>
	dir <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Dir</span><span class="token punctuation">(</span>fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;./oss/%s&quot;</span><span class="token punctuation">,</span> object<span class="token punctuation">.</span>Key<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token comment">// 检查目录是否存在</span>
	<span class="token keyword">if</span> <span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">:=</span> os<span class="token punctuation">.</span><span class="token function">Stat</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span><span class="token punctuation">;</span> os<span class="token punctuation">.</span><span class="token function">IsNotExist</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token comment">// 目录不存在，创建目录</span>
		err <span class="token operator">:=</span> os<span class="token punctuation">.</span><span class="token function">MkdirAll</span><span class="token punctuation">(</span>dir<span class="token punctuation">,</span> <span class="token number">0755</span><span class="token punctuation">)</span> <span class="token comment">// 0755是权限掩码，表示读写执行权限</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;创建目录时出错:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;目录创建成功:&quot;</span><span class="token punctuation">,</span> dir<span class="token punctuation">)</span>
	<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;目录已经存在:&quot;</span><span class="token punctuation">,</span> dir<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	err <span class="token operator">:=</span> bucket<span class="token punctuation">.</span><span class="token function">GetObjectToFile</span><span class="token punctuation">(</span>object<span class="token punctuation">.</span>Key<span class="token punctuation">,</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;./oss/%s&quot;</span><span class="token punctuation">,</span> object<span class="token punctuation">.</span>Key<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Error:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// 删除单个文件。</span>
	err <span class="token operator">=</span> bucket<span class="token punctuation">.</span><span class="token function">DeleteObject</span><span class="token punctuation">(</span>object<span class="token punctuation">.</span>Key<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Error:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),e=[o];function c(i,u){return s(),a("div",null,e)}const k=n(p,[["render",c],["__file","oss_down.html.vue"]]),r=JSON.parse('{"path":"/pages/scripts/oss_down.html","title":"Golang 脚本下载 aliyun oss 内所有的文件","lang":"zh-CN","frontmatter":{},"headers":[],"git":{"updatedTime":1715412522000,"contributors":[{"name":"go-bineanshi","email":"bineanshi@163.com","commits":1}]},"filePathRelative":"pages/scripts/oss_down.md"}');export{k as comp,r as data};
