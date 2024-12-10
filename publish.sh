#! /bin/bash

# Ask which type of version bump to perform
echo "What kind of version bump would you like?"
echo "1) patch (x.x.X) - Bug fixes"
echo "2) minor (x.X.x) - New features (backwards compatible)"
echo "3) major (X.x.x) - Breaking changes"
read -p "Enter 1, 2, or 3: " version_type

# Convert answer to semantic versioning type
case $version_type in
  1) bump="patch";;
  2) bump="minor";;
  3) bump="major";;
  *) echo "Invalid option. Exiting."; exit 1;;
esac

# Build, bump version, and publish
npm run build
npm version $bump
npm publish