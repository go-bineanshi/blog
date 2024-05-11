# Golang 脚本下载 aliyun oss 内所有的文件

```go
package main

import (
	"fmt"
	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"os"
	"path/filepath"
	"sync"
)

func main() {
	// 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量 OSS_ACCESS_KEY_ID 和OSS_ACCESS_KEY_SECRET。
	provider, err := oss.NewEnvironmentVariableCredentialsProvider()
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(-1)
	}
	// 创建OSSClient实例。
	// yourEndpoint填写Bucket对应的Endpoint，以华东1（杭州）为例，填写为https://oss-cn-hangzhou.aliyuncs.com。其它Region请按实际情况填写。
	client, err := oss.New("https://oss-cn-beijing.aliyuncs.com", "", "", oss.SetCredentialsProvider(&provider))
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(-1)
	}
	// 填写存储空间名称。
	bucketName := "ali-auction"
	bucket, err := client.Bucket(bucketName)

	if err != nil {
		panic(err)
	}

	continueToken := ""
	for {
		lsRes, err := bucket.ListObjectsV2(oss.ContinuationToken(continueToken))
		if err != nil {
			panic(err)
		}

		var wg sync.WaitGroup
		semaphore := make(chan struct{}, 10) // 控制并发数为10

		for _, object := range lsRes.Objects {
			wg.Add(1)
			semaphore <- struct{}{} // 占用一个信号量
			go func(obj oss.ObjectProperties) {
				defer func() {
					wg.Done()
					<-semaphore // 释放一个信号量
				}()
				downloadObject(bucket, obj)
			}(object)
		}
		wg.Wait()

		if lsRes.IsTruncated {
			continueToken = lsRes.NextContinuationToken
		} else {
			break
		}
	}
}

func downloadObject(bucket *oss.Bucket, object oss.ObjectProperties) {
	fmt.Println(object.Key, object.Type, object.Size, object.ETag, object.LastModified, object.StorageClass, "--", object.RestoreInfo)
	dir := filepath.Dir(fmt.Sprintf("./oss/%s", object.Key))
	// 检查目录是否存在
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// 目录不存在，创建目录
		err := os.MkdirAll(dir, 0755) // 0755是权限掩码，表示读写执行权限
		if err != nil {
			fmt.Println("创建目录时出错:", err)
			return
		}
		fmt.Println("目录创建成功:", dir)
	} else {
		fmt.Println("目录已经存在:", dir)
	}

	err := bucket.GetObjectToFile(object.Key, fmt.Sprintf("./oss/%s", object.Key))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// 删除单个文件。
	err = bucket.DeleteObject(object.Key)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
}
```
