# Optimal Desing

This application uses FG only for accounting purposes, it does not execute (yet?) anything, since it access existing resources.

## Configuration
Group configuration

```bash
curl -s -H "Content-type: application/json" -H "Authorization: $TKN" -d '{ "name": "optimal design" }' -X POST $BASEURL/$APIVER/groups
{
    "creation": "2020-07-01T09:33:21Z", 
    "id": 14, 
    "modified": "2020-07-01T09:33:21Z", 
    "name": "optimal design"
}
```
