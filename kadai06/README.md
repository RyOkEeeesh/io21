# IO21-06

## 目次
- [システム構成](#システム構成)
- [概要](#概要)
- [セットアップ](#セットアップ)
- [起動方法](#起動方法)
- [仕様](#仕様)

## システム構成
  - [Docker](https://www.docker.com/ja-jp/ 'Docker Home')
  - [Next.js](https://nextjs.org/ 'Next.js Home')
  - Python
  - WebSocket ( 以下 WSS )

## 概要
  ```mermaid
    flowchart LR
      subgraph Docker
      direction LR
        subgraph shared_data
        CSV
        end
      Python --更新--> CSV
      WSS --監視--> CSV
      WSS --更新通知--> display(クライアント) <--> API
      API --取得--> CSV
      end
  ```

## セットアップ

## 起動方法

## 仕様