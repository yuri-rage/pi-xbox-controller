#!/bin/bash

start_time=$(date +%s)

project_root="$(dirname "$(realpath "$0")")"
dist_dir="$project_root/dist"
release_dir="$project_root/release"
config_dir="$project_root/config"
src_dir="src"
server_dir="server"
version="v$(grep '"version":' $project_root/package.json | head -1 | awk -F '"' '{print $4}')"

echo -e "\nBuilding release for $version..."

if [ ! -d "$release_dir" ]; then
    echo -e "\nCreating release directory: $release_dir"
    mkdir -p "$release_dir"
else
    echo -e "\nCleaning release directory: $release_dir"
    rm -rf "$release_dir"/*
fi

#if npm run build; then
if npx vite build; then
    echo -e "\nBuild successful. Copying files to release directory...\n"
    cp -rv "$dist_dir" "$release_dir"
else
    echo -e "\nBuild failed. See errors above.\n"
    exit 1
fi

if [ ! -d "$project_root/$src_dir/$server_dir" ]; then
    echo -e "Source directory not found: $src_dir/$server_dir\n"
    exit 1
else
    echo -e "Copying source...\n"
    mkdir -p "$release_dir/$src_dir"
    cp -rv "$project_root/$src_dir/$server_dir" "$release_dir/$src_dir"
fi

if [ ! -d "$config_dir" ]; then
    echo -e "Config directory not found: $config_dir\n"
    exit 1
else
    echo -e "Copying config directory...\n"
    cp -rv "$config_dir" "$release_dir"
fi

echo -e "\nCopying additional files...\n"
cp -v "$project_root/package.json" "$release_dir"
cp -v "$project_root/vite.config.ts" "$release_dir"
cp -v "$project_root/gpio_preset.sh" "$release_dir"
echo "$version" > "$release_dir/version.txt"
cp -v "$project_root/LICENSE" "$release_dir"

echo -e "\nCreating release tarball...\n"
cd "$project_root"
tar -czvf release.tar.gz release

echo -e "\nRelease $version build complete.\n"

end_time=$(date +%s)
elapsed_time=$(( end_time - start_time ))
echo -e "Total build time: $elapsed_time seconds."
