import os
import subprocess
import re


def run_command(command: str) -> (str or None, str or None):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    if process.returncode != 0:
        return None, error.decode("utf-8")
    return output.decode("utf-8"), None


def run_command_with_logs(command: str):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    while True:
        output = process.stdout.readline()
        error = process.stderr.readline()

        if output == '' and error == '' and process.poll() is not None:
            break

        if output:
            print(output.strip())

        if error:
            print(error.strip())

    process.wait()
    if process.returncode != 0:
        print(f"Failed running command: {command}")
        exit(1)


def copy_file(src: str, dst: str):
    if os.path.exists(dst):
        return

    with open(src, "r") as src_file:
        with open(dst, "w") as dst_file:
            dst_file.write(src_file.read())


def validate_env_variables(file_path: str, env_variables: list[str]):
    with open(file_path, "r") as file:
        file_data = file.read()
        for env_variable in env_variables:
            if not re.search(rf"{env_variable}=\S+", file_data):
                print(f"Error: {env_variable} not set in {file_path}")
                exit(1)


def setup_supabase():
    print("Setting up supabase...")

    _, error = run_command("npx supabase status")
    if not error:
        return

    run_command_with_logs("npx supabase start")


def setup_env_files():
    if not os.path.exists("./api/.env"):
        copy_file("./api/.env.example", "./api/.env")

    if not os.path.exists("./web/.env"):
        copy_file("./web/.env.example", "./web/.env")


def setup_environmental_variables():
    print("Updating .env variables...")

    setup_env_files()

    supabase_status, error = run_command("npx supabase status")
    if error:
        print(f"Error occurred while fetching supabase status: {error}")
        exit(1)

    supabase_anon_key = supabase_status.split("anon key: ")[1].split("\n")[0]
    supabase_service_role_key = supabase_status.split("service_role key: ")[1].split("\n")[0]

    with open("./api/.env", "r+") as file:
        file_data = file.read()
        file_data = re.sub(r"SUPABASE_KEY=.*", f"SUPABASE_KEY={supabase_service_role_key}", file_data)
        file.seek(0)
        file.write(file_data)
        file.truncate()

    with open("./web/.env", "r+") as file:
        file_data = file.read()
        # required for supabase middleware fix
        file_data = re.sub(r"NEXT_PUBLIC_SUPABASE_ANON_KEY=.*", f"NEXT_PUBLIC_SUPABASE_ANON_KEY={supabase_anon_key}", file_data)
        file_data = re.sub(r"NEXT_PUBLIC_SUPABASE_KEY=.*", f"NEXT_PUBLIC_SUPABASE_KEY={supabase_anon_key}", file_data)
        file_data = re.sub(r"SUPABASE_SERVICE_KEY=.*", f"SUPABASE_SERVICE_KEY={supabase_service_role_key}", file_data)
        file.seek(0)
        file.write(file_data)
        file.truncate()


def run_docker_compose():
    print("Running docker compose...")

    validate_env_variables("./api/.env", ["SUPABASE_KEY"])
    validate_env_variables("./web/.env", ["NEXT_PUBLIC_SUPABASE_KEY", "SUPABASE_SERVICE_KEY"])

    run_command_with_logs("docker compose up -d")


def run():
    setup_supabase()
    setup_environmental_variables()
    run_docker_compose()
    print("Done! You can now access the web app at http://localhost:3000")


if __name__ == "__main__":
    run()
