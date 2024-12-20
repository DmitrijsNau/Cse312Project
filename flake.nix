{
  description = "nix flake for cse312 web app project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python3
            python3Packages.pip
            python3Packages.virtualenv
            docker
            nodejs
            nodePackages.npm
          ];

          shellHook = ''
            export DATABASE_URL="postgresql://BDSME:cse312@db:5432/BDSME"

            quiet="--quiet"
            if [ ! -d .venv ]; then
              python -m venv .venv
              unset quiet
            fi

            source .venv/bin/activate

            pip install $quiet -r requirements.txt
          '';
        };

        apps.default = flake-utils.lib.mkApp {
          drv = pkgs.writeShellScriptBin "docker-compose-up" ''
            # if ! systemctl is-active --quiet docker; then
            #   sudo systemctl start docker
            # fi

            ${pkgs.docker}/bin/docker compose up
          '';
        };

        apps.rebuild = flake-utils.lib.mkApp {
          drv = pkgs.writeShellScriptBin "docker-compose-rebuild" ''
            ${pkgs.docker}/bin/docker compose up --build --force-recreate
          '';
        };

        apps.resetdb = flake-utils.lib.mkApp {
          drv = pkgs.writeShellScriptBin "docker-compose-rebuild" ''
            ${pkgs.docker}/bin/docker compose down 
            ${pkgs.docker}/bin/docker volume rm cse312project_pgdata
          '';
        };

      }
    );
}
