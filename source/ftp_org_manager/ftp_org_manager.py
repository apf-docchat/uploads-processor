import os.path
import random
import string

import click
from passlib.apache import HtpasswdFile


def load_org_passwd(org_id):
    try:
        htpasswd_filepath = os.path.join(
            os.path.sep, "tmp", "orgs", org_id, "ftpusers.passwd"
        )
        return HtpasswdFile(
            htpasswd_filepath, autosave=True, default_scheme="des_crypt"
        )
    except FileNotFoundError:
        raise click.ClickException(
            click.style(f"Passwd file does not exist for {org_id}", fg="red")
        )


@click.group()
def orgs():
    pass


@orgs.command(name="list-orgs")
def list_orgs():
    """
    List the organizations for the FTP server
    """
    orgs_dir_path = os.path.join(os.path.sep, "tmp", "orgs")

    if not os.path.exists(orgs_dir_path):
        raise click.ClickException(click.style("Unable to read organizations dir", fg="red"))

    orgs_list = os.listdir(orgs_dir_path)

    if not orgs_list:
        click.secho("No organizations found.", fg="red", )

    for org_id in orgs_list:
        htpasswd_filepath = os.path.join(orgs_dir_path, org_id, "ftpusers.passwd")
        if os.path.exists(htpasswd_filepath):
            click.echo(org_id)


@click.group()
def org():
    """
    Manage an organizations for the FTP server
    """
    pass


@org.command(name="init-org")
@click.argument("org_id")
def org_init(org_id):
    """
    Initiate an organization
    """

    org_dir_path = os.path.join(os.path.sep, "tmp", "orgs", org_id)
    htpasswd_filepath = os.path.join(org_dir_path, "ftpusers.passwd")

    if os.path.exists(htpasswd_filepath):
        raise click.ClickException(click.style("Organization already exists", fg="red"))

    try:
        os.makedirs(org_dir_path, exist_ok=True)

        # Create the users file
        with open(htpasswd_filepath, "a"):
            os.utime(htpasswd_filepath, None)

        # Create logs dir
        logs_dir_path = os.path.join(org_dir_path, "logs")
        os.makedirs(logs_dir_path, exist_ok=True)
    except Exception as e:
        click.secho(
            "Failed to create users file for org. Please create it manually.",
            fg="red",
        )
        raise click.ClickException(click.style(e, fg="red"))

    click.secho(f'Created users file for organization "{org_id}"', fg="green")


@org.command(name="list-users")
@click.argument("org_id")
def list_users(org_id):
    """
    List the users in an organization
    """
    org_passwd = load_org_passwd(org_id)

    if not org_passwd.users():
        raise click.ClickException(click.style("No users found", fg="red"))

    for org_user in org_passwd.users():
        click.echo(org_user)


@click.group()
def user():
    """
    Manage a user in the organization
    """
    pass


@user.command(name="user-create")
@click.argument("org_id")
@click.argument("username")
def create_user(org_id, username):
    """
    Create a user in the organization
    """
    org_passwd = load_org_passwd(org_id)

    if org_passwd.get_hash(username):
        raise click.ClickException(click.style("User already exists", fg="red"))

    random_password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    org_passwd.set_password(username, random_password)

    click.secho(f'Created user in organization "{org_id}"', fg="green")
    click.echo(f"Username: {username}")
    click.echo(f"Password: {random_password}")


@user.command(name="user-verify")
@click.argument("org_id")
@click.argument("username")
def check_user(org_id, username):
    """
    Verify if a user exists in the organization
    """
    org_passwd = load_org_passwd(org_id)

    if not org_passwd.get_hash(username):
        raise click.ClickException(click.style("User does not exist", fg="red"))

    click.secho(f'User "{username}" exists for organization "{org_id}"', fg="green")


@user.command(name="user-password-verify")
@click.argument("org_id")
@click.argument("username")
@click.option("--password", prompt=True, hide_input=True)
def verify_password(org_id, username, password):
    """
    Verify password for a user
    """
    org_passwd = load_org_passwd(org_id)

    if not org_passwd.get_hash(username):
        raise click.ClickException(click.style("User does not exist", fg="red"))

    if org_passwd.check_password(username, password):
        click.secho(f'Password is correct for user "{username}"', fg="green")
    else:
        click.secho(f'Password is incorrect for user "{username}"', fg="red")


@user.command(name="user-password-reset")
@click.argument("org_id")
@click.argument("username")
def reset_password(org_id, username):
    """
    Reset password for a user
    """
    org_passwd = load_org_passwd(org_id)

    if not org_passwd.get_hash(username):
        raise click.ClickException(click.style("User does not exist", fg="red"))

    random_password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    org_passwd.set_password(username, random_password)

    click.secho(f'Password has been reset for user "{username}"', fg="green")
    click.echo(f"New password: {random_password}")


@user.command(name="user-remove")
@click.argument("org_id")
@click.argument("username")
def remove_user(org_id, username):
    """
    Remove a user from the organization
    """
    org_passwd = load_org_passwd(org_id)

    if not org_passwd.get_hash(username):
        raise click.ClickException(click.style("User does not exist", fg="red"))

    org_passwd.delete(username)

    click.secho(f'Removed user "{username}" from organization "{org_id}"', fg="green")


cli = click.CommandCollection(sources=[orgs, org, user])

if __name__ == "__main__":
    cli()
