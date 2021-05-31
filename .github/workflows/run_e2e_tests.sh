set -o errexit
set -o nounset
set -o pipefail

# Testing specific variables
avalanche_testing_repo="avaplatform/avalanche-testing"

# Define avalanche testing version to use
avalanche_testing_image="avaplatform/avalanche-testing:master"

# Fetch the images
# If Docker Credentials are not available fail
if [[ -z ${DOCKER_USERNAME} ]]; then
    echo "Skipping Tests because Docker Credentials were not present."
    exit 1
fi

# Avalanche root directory
AVALANCHE_PATH=$( cd "$( dirname "${BASH_SOURCE[0]}" )"; cd ../.. && pwd )

current_branch=$(git branch --show-current)

# Login to docker
echo "$DOCKER_PASS" | docker login --username "$DOCKER_USERNAME" --password-stdin

# Checks available docker tags exist
function docker_tag_exists() {
    TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKER_USERNAME}'", "password": "'${DOCKER_PASS}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
    curl --silent -H "Authorization: JWT ${TOKEN}" -f --head -lL https://hub.docker.com/v2/repositories/$1/tags/$2/ > /dev/null
}

# Defines the avalanche-testing tag to use
# Either uses the same tag as the current branch or uses the default
if docker_tag_exists $avalanche_testing_repo $current_branch; then
    echo "$avalanche_testing_repo:$current_branch exists; using this image to run e2e tests"
    avalanche_testing_image="$avalanche_testing_repo:$current_branch"
else
    echo "$avalanche_testing_repo $current_branch does NOT exist; using the default image to run e2e tests"
fi

echo "Using $avalanche_testing_image for e2e tests"

# Setting the build ID
git_commit_id=$( git rev-list -1 HEAD )

# Always use avalanchego latest to build the network nodes
avalanche_image="avaplatform/avalanchego:latest"

echo "Running Avalanche Image: ${avalanche_image}"
echo "Running Avalanche Image Tag: $current_branch"
echo "Running Avalanche Testing Image: ${avalanche_testing_image}"
echo "Git Commit ID : ${git_commit_id}"

# pull the latest images
docker pull $avalanche_testing_image
docker pull $avalanche_image

testBatch="${1:-}"
shift 1

# >>>>>>>> avalanche-testing custom parameters <<<<<<<<<<<<<
custom_params_json="{
    \"isKurtosisCoreDevMode\": false,
    \"avalanchegoImage\":\"${avalanche_image}\",
     \"testBatch\":\"${testBatch}\"
}"
# >>>>>>>> avalanche-testing custom parameters <<<<<<<<<<<<<

bash "$AVALANCHE_PATH/.kurtosis/kurtosis.sh" \
    --custom-params "${custom_params_json}" \
    "${avalanche_testing_image}" \
    $@
