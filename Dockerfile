FROM --platform=linux/x86_64 node:18.20.4

# システムの更新とロケールの設定
RUN apt-get update && \
    apt-get install -y locales && \
    locale-gen ja_JP.UTF-8 && \
    localedef -f UTF-8 -i ja_JP ja_JP

# 環境変数の設定
ENV LANG ja_JP.UTF-8
ENV TZ Asia/Tokyo

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストール
COPY package.json yarn.lock ./
RUN yarn install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを起動するためのコマンド
CMD ["yarn", "start"]
