select
    "showtimes"."id" as "id",
    "showtimes"."movie_id" as "movie_id",
    "showtimes"."room_id" as "room_id",
    "showtimes"."start_time" as "start_time",
    "movie"."id" as "movie:id",
    "movie"."title" as "movie:title",
    "movie"."description" as "movie:description",
    "movie"."genre" as "movie:genre",
    "movie"."duration" as "movie:duration",
    "movie"."release_date" as "movie:release_date",
    "movie"."created_at" as "movie:created_at",
    "movie"."updated_at" as "movie:updated_at",
    "room"."id" as "room:id",
    "room"."name" as "room:name",
    "room"."capacity" as "room:capacity",
    "room"."created_at" as "room:created_at",
    "room"."updated_at" as "room:updated_at",
    "room:seats"."id" as "room:seats:id",
    "room:seats"."seat_number" as "room:seats:seat_number"
from
    "showtimes"
    left join "movies" as "movie" on "movie"."id" = "showtimes"."movie_id"
    left join "rooms" as "room" on "room"."id" = "showtimes"."room_id"
    left join (
        select
            "id",
            "seat_number",
            "seats"."room_id"
        from
            "seats"
    ) as "room:seats" on "room:seats"."room_id" = "room"."id"
where
    "showtimes"."id" = ?