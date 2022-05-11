import { GetStaticPaths, GetStaticProps } from 'next'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post as PostType } from '../../typings'
import type { NextPage } from 'next'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'
type Props = {
    post: PostType
}
interface IFormInput {
    _id: string
    name: string
    email: string
    comment: string
}
const Post: NextPage<Props> = ({ post }) => {
    const [submitted, setSubmitted] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>()
    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data),
        })
            .then(() => {
                console.log(data)
                setSubmitted(true)
            })
            .catch((err) => {
                console.error(err)
                setSubmitted(false)
            })
    }

    return (
        <main>
            <Header />
            <img
                className="h-40 w-full object-cover"
                src={urlFor(post.mainImage).url()!}
                alt="post"
            />
            <article className="mx-auto max-w-3xl p-2">
                <p className="mt-10 mb-3 text-3xl">{post.title}</p>
                <p className="mb-2 text-xl font-light text-gray-500">
                    {post.description}
                </p>
                <div className="flex items-center space-x-2">
                    <img
                        className="h-10 w-10 rounded-full"
                        src={urlFor(post.author.image).url()!}
                        alt="profile"
                    />
                    <p className="text-sm font-extralight">
                        Blog post by{' '}
                        <span className="text-green-500">
                            {post.author.name}
                        </span>{' '}
                        - Published at{' '}
                        {new Date(post._createdAt).toLocaleString()}
                    </p>
                </div>
                <div>
                    <PortableText
                        className="mt-10"
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        content={post.body}
                        serializers={{
                            h1: (props: any) => (
                                <h1
                                    className="my-5 text-2xl font-bold"
                                    {...props}
                                />
                            ),
                            h2: (props: any) => (
                                <h2
                                    className="my-5 text-xl font-bold"
                                    {...props}
                                />
                            ),
                            li: ({ children }: any) => (
                                <li className="my-4 list-disc">{children}</li>
                            ),
                            link: ({ href, children }: any) => (
                                <a
                                    href={href}
                                    className="text-blue-500 hover:underline"
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    />
                </div>
            </article>
            <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />
            {submitted ? (
                <div className="my-10 mx-auto flex max-w-2xl flex-col bg-yellow-500 p-10 py-10 text-white">
                    <p className="text-3xl font-bold">
                        Thank you for submitting your comment!
                    </p>
                    <p>Once it's been approved it will apear bellow</p>
                </div>
            ) : (
                <form
                    className="my-10 mx-auto flex max-w-2xl flex-col p-5"
                    action=""
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <p className="text-sm text-yellow-500">
                        Enjoyed this article?
                    </p>
                    <p className="text-3xl font-bold">
                        Leave a comment bellow!
                    </p>
                    <hr className="mt-2 py-3" />
                    {/* Enhance our input field, to create connection to hook-form*/}
                    <input
                        {...register('_id')}
                        type="hidden"
                        name="_id"
                        value={post._id}
                    />
                    <label className="mb-5 block">
                        <span className="text-gray-700">Name</span>
                        <input
                            {...register('name', { required: true })}
                            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring"
                            type="text"
                            placeholder="Dan Mark"
                        />
                    </label>{' '}
                    <label className="mb-5 block">
                        <span className="text-gray-700">Email</span>
                        <input
                            {...register('email', { required: true })}
                            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring"
                            type="email"
                            placeholder="Dan Mark"
                        />
                    </label>{' '}
                    <label className="mb-5 block">
                        <span className="text-gray-700">Comment</span>
                        <textarea
                            {...register('comment', { required: true })}
                            className=" form-textarea mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-yellow-500 focus:ring"
                            rows={8}
                            placeholder="Dan Mark"
                        />
                    </label>
                    <div className="flex flex-col p-5">
                        {errors.name && (
                            <span className="text-red-500">
                                - The Name Field is required
                            </span>
                        )}{' '}
                        {errors.comment && (
                            <span className="text-red-500">
                                - The Comment Field is required
                            </span>
                        )}{' '}
                        {errors.email && (
                            <span className="text-red-500">
                                - The Email Field is required
                            </span>
                        )}
                    </div>
                    <input
                        className="focus:shadow-outline cursor-pointer rounded bg-yellow-500 py-2 px-4 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none"
                        type={'submit'}
                    />
                </form>
            )}
            {/* Comments */}
            <section
                className="my-10 mx-auto flex max-w-2xl flex-col space-y-2 p-10 shadow shadow-yellow-500
                "
            >
                <p className="text-4xl">Comments</p>
                <hr className="pb-2" />
                {post.comments.map((comment) => (
                    <div key={comment._id}>
                        <p>
                            <span className="text-yellow-500">
                                {comment.name}
                            </span>
                            : {comment.comment}
                        </p>
                    </div>
                ))}
            </section>
        </main>
    )
}

export default Post

export const getStaticPaths: GetStaticPaths = async () => {
    const query = `*[_type =='post']{
        _id,
        slug {
      current},
      }`
    const posts = await sanityClient.fetch(query)
    const paths = posts.map((post: PostType) => ({
        params: { slug: post.slug.current },
    }))
    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `*[_type == 'post' && slug.current == $slug][0] {
        _id,
        _createdAt,
        title,
        author-> {
            name,
            image
        },
        'comments': *[
            _type == 'comment' &&
            post._ref == ^._id &&
            approved == true
        ],
        description,
        mainImage,
        slug,
        body
    }`
    // 'comments': *[
    //     _type =='comment &&
    //     post._ref == ^._id &&
    //     approved ==true],
    const post = await sanityClient.fetch(query, { slug: params?.slug })

    if (!post) {
        return {
            notFound: true,
        }
    }
    return {
        props: { post },
        revalidate: 60,
    }
}