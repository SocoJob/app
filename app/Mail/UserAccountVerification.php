<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserAccountVerification extends Mailable
{

    use Queueable, SerializesModels;

    public $data;

    public function __construct( $input)
    {
        $this->data = $input;
        $this->data['message'] = __('Your account has been verified successfully.');
        return $this->data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build(): self
    {
        return $this->from(config('mail.from.address'))
            ->subject(__('User Account Verified'))
            ->markdown('emails.user.email_account_verified');
    }
}
