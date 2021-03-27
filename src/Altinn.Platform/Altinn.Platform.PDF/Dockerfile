# 
FROM maven:3.6.3-openjdk-15 AS build
WORKDIR build
COPY . .
RUN mvn -Pprod package

FROM openjdk:15-jdk-slim-buster AS final
WORKDIR app
COPY --from=build /build/target .
# setup the user and group
# the user will have no password, using shell /bin/false and using the group dotnet
RUN addgroup --gid 3000 dotnet && adduser --uid 1000 --group dotnet -s /bin/false dotnet --disabled-login
# update permissions of files if neccessary before becoming dotnet user
USER dotnet
CMD ["java", "-jar", "./Altinn.Platform.PDF-1.0.jar"]
