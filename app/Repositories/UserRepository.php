<?php

namespace App\Repositories;

use App\Models\User;
use Auth;
use Exception;
use Hash;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class UserRepository
 * @version January 11, 2020, 11:09 am UTC
 */
class UserRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'email',
        'phone',
    ];

    /**
     * Return searchable fields
     *
     * @return array
     */
    public function getFieldsSearchable()
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return User::class;
    }

    /**
     * @param array $input
     *
     * @return User
     */
    public function store($input)
    {
        try {
            /** @var User $user */
            $user = User::create($input);
            $this->assignRoles($user, $input);

            return $user;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @param array $input
     *
     * @return bool
     */
    public function profileUpdate($input)
    {
        /** @var User $user */
        $user = Auth::user();

        try {
            $user->update($input);

            if ((isset($input['image']))) {
                $user->clearMediaCollection(User::PROFILE);
                $user->addMedia($input['image'])
                    ->toMediaCollection(User::PROFILE, config('app.media_disc'));
            }
            $user->is_verified = 1;
            $user->save();
            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @param  array  $input
     *
     * @return bool
     */
    public function changePassword($input)
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            if (! Hash::check($input['password_current'], $user->password)) {
                throw new UnprocessableEntityHttpException('Current password is invalid.');
            }
            $input['password'] = Hash::make($input['password']);
            $user->update($input);

            return true;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @param $input
     *
     *
     * @return User
     */
    public function adminStore($input)
    {
        try {
            /** @var User $user */

            $input['password'] = Hash::make($input['password']);
            $user = User::create($input);
            
            if ((isset($input['profile']))) {
                $user->clearMediaCollection(User::PROFILE);
                $user->addMedia($input['profile'])
                    ->toMediaCollection(User::PROFILE, config('app.media_disc'));
            }
            
            $role = Role::where('name', 'Admin')->first();
            $user->assignRole($role);
            return $user;
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @param $user
     * @param $input
     *
     *
     * @return bool
     */
    public function updateAdmin($user, $input){
        try {
            /** @var User $user */
            
            if($input['update_password']){
                $input['password'] = Hash::make($input['update_password']);
            }
            
            $user->update($input);

            if (isset($input['profile']) && ! empty($input['profile'])) {
                $user->clearMediaCollection(User::PROFILE);
                $user->addMedia($input['profile'])
                    ->toMediaCollection(User::PROFILE, config('app.media_disc'));
            }

        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }

        return true;
    }
}
